from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Chapter, Course, Enrollment


class CourseApiTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.instructor = User.objects.create_user(
            username="instructor",
            password="VeryStrongPass123!",
            role="instructor",
        )
        self.other_instructor = User.objects.create_user(
            username="other-instructor",
            password="VeryStrongPass123!",
            role="instructor",
        )
        self.student = User.objects.create_user(
            username="student",
            password="VeryStrongPass123!",
            role="student",
        )
        self.course = Course.objects.create(
            title="Intro to LMS",
            description="A starter course",
            instructor=self.instructor,
        )
        self.public_chapter = Chapter.objects.create(
            course=self.course,
            number=1,
            title="Welcome",
            content=[{"type": "p", "children": [{"text": "Hello"}]}],
            is_public=True,
        )
        self.private_chapter = Chapter.objects.create(
            course=self.course,
            number=2,
            title="Instructor Notes",
            content=[{"type": "p", "children": [{"text": "Private"}]}],
            is_public=False,
        )

    def test_only_instructors_create_courses(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("course-list"),
            {"title": "Blocked", "description": "Students cannot create courses"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.instructor)
        response = self.client.post(
            reverse("course-list"),
            {"title": "Created", "description": "Instructor course"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["instructor"], str(self.instructor))
        self.assertRegex(response.data["course_code"], r"^[A-Z0-9]{8}$")

    def test_course_code_is_only_visible_to_owner(self):
        self.client.force_authenticate(user=self.instructor)

        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course_data = next(course for course in response.data if course["id"] == self.course.id)
        self.assertEqual(course_data["course_code"], self.course.course_code)

        self.client.force_authenticate(user=self.student)
        response = self.client.get(reverse("course-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        course_data = next(course for course in response.data if course["id"] == self.course.id)
        self.assertIsNone(course_data["course_code"])

    def test_only_course_owner_can_create_and_update_chapters(self):
        self.client.force_authenticate(user=self.other_instructor)

        response = self.client.post(
            reverse("chapter-list", kwargs={"course_pk": self.course.pk}),
            {
                "number": 3,
                "title": "Blocked",
                "content": [{"type": "p", "children": [{"text": "Nope"}]}],
                "is_public": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.instructor)
        response = self.client.put(
            reverse(
                "chapter-detail",
                kwargs={
                    "course_pk": self.course.pk,
                    "chapter_pk": self.private_chapter.pk,
                },
            ),
            {
                "number": 2,
                "title": "Published Notes",
                "content": [{"type": "p", "children": [{"text": "Ready"}]}],
                "is_public": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_public"])

    def test_student_can_enroll_once(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("enroll-course", kwargs={"course_pk": self.course.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(student=self.student, course=self.course).exists()
        )

        response = self.client.post(
            reverse("enroll-course", kwargs={"course_pk": self.course.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_student_can_enroll_by_course_code(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("enroll-course-by-code"),
            {"course_code": self.course.course_code.lower()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(student=self.student, course=self.course).exists()
        )

    def test_invalid_course_code_returns_not_found(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.post(
            reverse("enroll-course-by-code"),
            {"course_code": "NOPE1234"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_enrolled_student_only_sees_public_chapters(self):
        Enrollment.objects.create(student=self.student, course=self.course)
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("chapter-list", kwargs={"course_pk": self.course.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            [chapter["id"] for chapter in response.data],
            [self.public_chapter.id],
        )

        response = self.client.get(
            reverse(
                "chapter-detail",
                kwargs={
                    "course_pk": self.course.pk,
                    "chapter_pk": self.private_chapter.pk,
                },
            ),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unenrolled_student_cannot_read_chapters(self):
        self.client.force_authenticate(user=self.student)

        response = self.client.get(
            reverse("chapter-list", kwargs={"course_pk": self.course.pk}),
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
