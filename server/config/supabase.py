from supabase import create_client, Client
from .settings import Settings
settings = Settings()
class SupabaseConfig:
    def __init__(self):
        self.supabase_url = settings.supabase_url
        self.supabase_key = settings.supabase_key
        self.client: Client = create_client(self.supabase_url, self.supabase_key)