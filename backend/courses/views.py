from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Chapter, Course, Enrollment
from .serializers import (
    ChapterSerializer,
    CourseSerializer,
    EnrollmentSerializer,
)


def is_instructor(user):
    return user.is_authenticated and user.role == "instructor"


def is_student(user):
    return user.is_authenticated and user.role == "student"


def is_course_owner(user, course):
    return is_instructor(user) and course.instructor == user


def is_enrolled(user, course):
    return (
        is_student(user)
        and Enrollment.objects.filter(student=user, course=course).exists()
    )


class CourseListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        courses = Course.objects.select_related("instructor").all()
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not is_instructor(request.user):
            return Response(
                {"detail": "Only instructors can create courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(instructor=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseSerializer(course)
        return Response(serializer.data)

    def patch(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only this course's instructor can edit it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only this course's instructor can delete it."},
                status=status.HTTP_403_FORBIDDEN,
            )

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CourseJoinView(APIView):
    def post(self, request, course_id):
        if not is_student(request.user):
            return Response(
                {"detail": "Only students can join courses."},
                status=status.HTTP_403_FORBIDDEN,
            )

        course = get_object_or_404(Course, id=course_id)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
        )

        if not created:
            return Response(
                {"detail": "You are already enrolled in this course."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseChaptersView(APIView):
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        if is_course_owner(request.user, course):
            chapters = course.chapters.all()
        elif is_enrolled(request.user, course):
            chapters = course.chapters.filter(is_public=True)
        else:
            return Response(
                {"detail": "Join this course to read its public chapters."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapters, many=True)
        return Response(serializer.data)

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        if not is_course_owner(request.user, course):
            return Response(
                {"detail": "Only this course's instructor can add chapters."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(course=course)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ChapterDetailView(APIView):
    def get_chapter(self, chapter_id):
        return get_object_or_404(
            Chapter.objects.select_related("course", "course__instructor"),
            id=chapter_id,
        )

    def get(self, request, chapter_id):
        chapter = self.get_chapter(chapter_id)
        course = chapter.course

        if not (
            is_course_owner(request.user, course)
            or (chapter.is_public and is_enrolled(request.user, course))
        ):
            return Response(
                {"detail": "You cannot read this chapter."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapter)
        return Response(serializer.data)

    def patch(self, request, chapter_id):
        chapter = self.get_chapter(chapter_id)

        if not is_course_owner(request.user, chapter.course):
            return Response(
                {"detail": "Only this course's instructor can edit chapters."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ChapterSerializer(chapter, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, chapter_id):
        chapter = self.get_chapter(chapter_id)

        if not is_course_owner(request.user, chapter.course):
            return Response(
                {"detail": "Only this course's instructor can delete chapters."},
                status=status.HTTP_403_FORBIDDEN,
            )

        chapter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
