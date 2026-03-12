from fastapi import APIRouter
from app.api.v1 import auth, debates, arguments, users,admin,tags

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(debates.router)
api_router.include_router(arguments.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
api_router.include_router(tags.router)