from django.contrib import admin

from .models import Chapter, Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor"]
    search_fields = ["title", "description", "instructor__username"]


@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ["title", "number", "course"]
    list_editable = ["number"]
    list_filter = ["course"]
    ordering = ["course", "number", "id"]
    search_fields = ["title", "content", "course__title"]
