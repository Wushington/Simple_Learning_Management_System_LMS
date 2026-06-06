from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsCourseInstructorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user.is_authenticated
            and obj.instructor == request.user
        )


class IsChapterCourseInstructorOrPublicReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        user = request.user

        if request.method in SAFE_METHODS:
            if obj.is_public:
                return True
            return user.is_authenticated and obj.course.instructor == user

        return user.is_authenticated and obj.course.instructor == user
