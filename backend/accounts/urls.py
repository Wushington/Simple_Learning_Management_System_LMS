from django.urls import path, include
from .views import register_user, get_user


urlpatterns = [
    path("auth/", include("rest_framework.urls")),  # For login/logout
    path("register/", register_user, name="register"),  # For user registration
    path("me/", get_user, name="me"),  # For getting user info
]
