from typing import List
from fastapi import HTTPException, status
from app.models.user import UserRole

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return True

# Permission checkers
allow_admin = RoleChecker([UserRole.ADMIN])
allow_moderator = RoleChecker([UserRole.ADMIN, UserRole.MODERATOR])
allow_verified = RoleChecker([UserRole.ADMIN, UserRole.MODERATOR, UserRole.VERIFIED_USER])
allow_all_authenticated = RoleChecker([UserRole.ADMIN, UserRole.MODERATOR, UserRole.VERIFIED_USER, UserRole.GUEST])