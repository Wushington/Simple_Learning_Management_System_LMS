from django.contrib import admin

from .models import Chapter, Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor"]
    search_fields = ["title", "description", "instructor__username"]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ["title", "number", "course", "is_public"]
    list_editable = ["number"]
    list_filter = ["course", "is_public"]
    ordering = ["course", "number", "id"]
    search_fields = ["title", "content", "course__title"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["student", "course", "enrolled_at"]
    list_filter = ["course", "enrolled_at"]
    search_fields = ["student__username", "course__title"]
