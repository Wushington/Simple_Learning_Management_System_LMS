from django.urls import path

from .views import (
    ChapterDetailView,
    CourseChaptersView,
    CourseDetailView,
    CourseJoinView,
    CourseListCreateView,
)

urlpatterns = [
    path("courses/", CourseListCreateView.as_view(), name="course-list-create"),
    path("courses/<int:course_id>/", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/join/", CourseJoinView.as_view(), name="course-join"),
    path(
        "courses/<int:course_id>/chapters/",
        CourseChaptersView.as_view(),
        name="course-chapters",
    ),
    path("chapters/<int:chapter_id>/", ChapterDetailView.as_view(), name="chapter-detail"),
]
