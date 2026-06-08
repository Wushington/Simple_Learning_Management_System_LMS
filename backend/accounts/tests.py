from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


class RegisterUserTests(APITestCase):
    def test_register_creates_user_with_hashed_password_and_role(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "new-instructor",
                "email": "instructor@example.com",
                "password": "VeryStrongPass123!",
                "role": "instructor",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["username"], "new-instructor")
        self.assertEqual(response.data["role"], "instructor")
        self.assertNotIn("password", response.data)

    def test_register_rejects_password_too_similar_to_user_details(self):
        response = self.client.post(
            reverse("register"),
            {
                "username": "instructor1",
                "email": "instructor@example.com",
                "password": "instructor-123",
                "role": "instructor",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)
