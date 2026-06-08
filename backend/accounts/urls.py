from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import register_user, get_user


urlpatterns = [
    path("auth/", include("rest_framework.urls")),  # For login/logout
    path("register/", register_user, name="register"),  # For user registration
    path("me/", get_user, name="me"),  # For getting user info
    path("token/", TokenObtainPairView.as_view(), name="token-obtain-pair"), # For obtaining JWT token
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"), # For refreshing JWT token
]
