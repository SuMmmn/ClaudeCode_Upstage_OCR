from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    upstage_api_key: str = ""
    database_url: str = "sqlite:///./data/receipts.db"
    upload_dir: str = "./uploads"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
