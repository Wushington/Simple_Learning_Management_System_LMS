# Simple Learning Management System (LMS)

A small full-stack LMS project built to practice Django REST Framework, role-based API behavior, and a React frontend that can store rich lesson content as JSON.

## Project Goal

This project is my first time working with Django REST Framework (DRF). I used it to learn how a Django backend can expose API endpoints for a frontend instead of rendering pages directly from Django templates.

The main learning goal was to understand how models, serializers, views, permissions, and frontend API calls fit together.

## Tech Stack

- Backend: Django, Django REST Framework
- Authentication: JWT tokens
- Frontend: React, Vite, Axios
- Rich text content: Plate.js JSON stored in Django's `JSONField`

## Project Structure

- `backend/` - Django project, apps, API routes, and migrations
- `src/` - React application source
- `public/` - static frontend assets copied into the Vite build
- `.github/workflows/` - GitHub Actions deployment workflow
- `dist/` - generated frontend build output; ignored by git

## Current Features

- Users can register with a role of `student` or `instructor`.
- Instructors can create, update, and delete courses.
- Instructors can add chapters to their own courses.
- Students can enroll in courses.
- Students can only view public chapters for courses they are enrolled in.
- Chapter content is stored as JSON so the frontend editor can save structured rich text.

## Learning Notes

### DRF Concepts I Practiced

Before this project, I had not used DRF. These are the main pieces I learned while building it:

- `ModelSerializer` turns Django models into JSON responses and validates incoming request data.
- `APIView` lets each HTTP method (`get`, `post`, `put`, `delete`) have its own Python method.
- Function-based DRF views can be created with `@api_view`.
- `permission_classes` and `get_permissions()` control which endpoints require authentication.
- `Response` is DRF's version of returning API data with proper HTTP status codes.
- `status.HTTP_...` constants make responses clearer than using raw status numbers.
- Related model data can be exposed with fields like `StringRelatedField`.
- Some serializer fields should be read-only so the backend, not the user, controls them.

### Function-Based vs Class-Based Views

I used both styles while learning DRF.

Function-based views are useful for smaller endpoints:

```python
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
```

Class-based views are useful when one URL supports several HTTP methods:

```python
class CourseDetailView(APIView):
    def get(self, request, pk):
        # read one course
        pass

    def put(self, request, pk):
        # update one course
        pass

    def delete(self, request, pk):
        # delete one course
        pass
```

### Rich Text Chapter Content Flow

The chapter content flow helped me understand how frontend state can map to backend storage:

1. The instructor writes chapter content in Plate.js.
2. React stores the Plate editor value as JSON.
3. React sends that JSON to the DRF API.
4. DRF validates the request with `ChapterSerializer`.
5. Django saves the JSON in `Chapter.content`.
6. Students request public chapter content through the API.

## API Routes

### Accounts

- `POST /api/accounts/register/` - create a new user
- `GET /api/accounts/me/` - get the current authenticated user
- `POST /api/accounts/token/` - get JWT access and refresh tokens
- `POST /api/accounts/token/refresh/` - get a new access token

### Courses

- `GET /api/courses/` - list courses
- `POST /api/courses/` - create a course as an instructor
- `GET /api/courses/<id>/` - view one course
- `PUT /api/courses/<id>/` - update a course as its instructor
- `DELETE /api/courses/<id>/` - delete a course as its instructor

### Chapters and Enrollments (In Courses app)

- `GET /api/courses/<course_id>/chapters/` - list visible chapters
- `POST /api/courses/<course_id>/chapters/` - add a chapter as the course instructor
- `GET /api/courses/<course_id>/chapters/<chapter_id>/` - view one visible chapter
- `PUT /api/courses/<course_id>/chapters/<chapter_id>/` - update a chapter as the course instructor
- `DELETE /api/courses/<course_id>/chapters/<chapter_id>/` - delete a chapter as the course instructor
- `POST /api/courses/<course_id>/enroll/` - enroll in a course as a student
- `GET /api/enrollments/` - list enrollments as a student

## Local Setup

### Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd backend
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
npm install
npm run dev
```

The React app now lives at the repository root. For GitHub Pages, push to `main` and let the workflow build `dist/` and publish the compiled app.

## Reference Links

- [Official DRF Documentation](https://www.django-rest-framework.org/)
- [Official Axios Repo](https://github.com/axios/axios)
- [Django REST Framework Oversimplified](https://www.youtube.com/watch?v=cJveiktaOSQ)
- [Python Django REST API In 30 Minutes - Django Tutorial](https://www.youtube.com/watch?v=NoLF7Dlu5mc)
- [React Django Tutorial - Learn React Python Django In 1 Hour | For Beginners](https://www.youtube.com/watch?v=xldTxXtNiuk)

Note: I used AI tools as a learning aid while building this project, especially while learning Django REST Framework for the first time. I used those tools (along with the videos) to explain these unfamiliar concepts and help me understand how serializers, views, permissions, and JWT authentication fit together.
