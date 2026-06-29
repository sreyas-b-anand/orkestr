from pydantic_settings import BaseSettings , SettingsConfigDict

class Settings(BaseSettings):
    groq_api_key: str
    supabase_url : str
    supabase_key : str
    frontend_url : str
    supabase_jwt_secret : str
    
    redis_url : str


    model_config = SettingsConfigDict(env_file=".env")
    
settings = Settings()