from django.urls import path, include
from .views import RegisterView, UserView


urlpatterns = [
    path("auth/", include("rest_framework.urls")),  # For login/logout
    path("register/", RegisterView.as_view(), name="register"),  # For user registration
    path("me/", UserView.as_view(), name="me"),  # For getting user info
]
