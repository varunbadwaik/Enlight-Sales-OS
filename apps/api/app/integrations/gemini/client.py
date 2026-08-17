import google.generativeai as genai
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiClient:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL

    def extract_from_document(
        self,
        document_bytes: bytes,
        mime_type: str,
        system_prompt: str,
        user_prompt: str
    ) -> Dict[str, Any]:
        """Calls Gemini API with multimodal document payload and system instructions."""
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Returning mock/stub response for development.")
            return {}

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config={
                    "temperature": settings.GEMINI_TEMPERATURE,
                    "max_output_tokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
                    "response_mime_type": "application/json"
                },
                system_instruction=system_prompt
            )

            contents = [
                {"mime_type": mime_type, "data": document_bytes},
                user_prompt
            ]

            response = model.generate_content(contents)
            response_text = response.text.strip()

            # Clean potential markdown wrapping if present
            if response_text.startswith("```json"):
                response_text = response_text.lstrip("```json").rstrip("```").strip()
            elif response_text.startswith("```"):
                response_text = response_text.lstrip("```").rstrip("```").strip()

            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Gemini API Extraction Error: {e}")
            raise e

    def extract_from_text(self, text_content: str, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        """Calls Gemini API for text-only inputs e.g. WhatsApp dispatch messages."""
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured. Returning mock/stub response for development.")
            return {}

        try:
            model = genai.GenerativeModel(
                model_name=self.model_name,
                generation_config={
                    "temperature": settings.GEMINI_TEMPERATURE,
                    "max_output_tokens": settings.GEMINI_MAX_OUTPUT_TOKENS,
                    "response_mime_type": "application/json"
                },
                system_instruction=system_prompt
            )

            contents = [user_prompt, f"Text to extract:\n{text_content}"]
            response = model.generate_content(contents)
            response_text = response.text.strip()

            if response_text.startswith("```json"):
                response_text = response_text.lstrip("```json").rstrip("```").strip()
            elif response_text.startswith("```"):
                response_text = response_text.lstrip("```").rstrip("```").strip()

            return json.loads(response_text)

        except Exception as e:
            logger.error(f"Gemini API Text Extraction Error: {e}")
            raise e

gemini_client = GeminiClient()
