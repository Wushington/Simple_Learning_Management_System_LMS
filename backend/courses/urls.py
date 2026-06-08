from django.urls import path

from .views import (
    ChapterDetailView,
    ChapterListView,
    CourseDetailView,
    CourseListView,
    EnrollCourseByCodeView,
    EnrollCourseView,
    EnrollmentListView,
    UnenrollCourseView,
)


urlpatterns = [
    path("courses/", CourseListView.as_view(), name="course-list"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path(
        "courses/<int:course_pk>/chapters/",
        ChapterListView.as_view(),
        name="chapter-list",
    ),
    path(
        "courses/<int:course_pk>/chapters/<int:chapter_pk>/",
        ChapterDetailView.as_view(),
        name="chapter-detail",
    ),
    path(
        "courses/<int:course_pk>/enroll/",
        EnrollCourseView.as_view(),
        name="enroll-course",
    ),
    path(
        "courses/<int:course_pk>/unenroll/",
        UnenrollCourseView.as_view(),
        name="unenroll-course",
    ),
    path(
        "courses/enroll-by-code/",
        EnrollCourseByCodeView.as_view(),
        name="enroll-course-by-code",
    ),
    path("enrollments/", EnrollmentListView.as_view(), name="enrollment-list"),
]
