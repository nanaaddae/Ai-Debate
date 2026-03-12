from groq import Groq
from app.config import settings


class AIService:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"  # Updated model!

    async def generate_debate_arguments(self, topic: str) -> dict:
        """Generate both pro and con arguments for a debate topic"""

        pro_prompt = f"""Generate a compelling, well-reasoned PRO argument for the following debate topic. 
        Be persuasive but factual. Keep it under 300 words.

        Topic: {topic}

        Provide only the argument, no preamble."""

        con_prompt = f"""Generate a compelling, well-reasoned CON argument for the following debate topic.
        Be persuasive but factual. Keep it under 300 words.

        Topic: {topic}

        Provide only the argument, no preamble."""

        # Generate pro argument
        pro_response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": pro_prompt}],
            model=self.model,
            temperature=0.7,
            max_tokens=500
        )

        # Generate con argument
        con_response = self.client.chat.completions.create(
            messages=[{"role": "user", "content": con_prompt}],
            model=self.model,
            temperature=0.7,
            max_tokens=500
        )

        return {
            "pro": pro_response.choices[0].message.content.strip(),
            "con": con_response.choices[0].message.content.strip()
        }


ai_service = AIService()