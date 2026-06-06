from rest_framework.routers import DefaultRouter

from .views import ChapterViewSet, CourseViewSet

router = DefaultRouter()
router.register("courses", CourseViewSet, basename="course")
router.register("chapters", ChapterViewSet, basename="chapter")

urlpatterns = router.urls
