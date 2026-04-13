from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    upstage_api_key: str = ""
    database_url: str = "sqlite:///./data/receipts.db"
    upload_dir: str = "./uploads"
    allowed_origins: str = "http://localhost:5173,http://localhost:4173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
