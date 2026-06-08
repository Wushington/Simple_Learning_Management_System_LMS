import api from "./api";


// Authentication-related API functions
async function login(username, password) {
	const response = await api.post("/accounts/token/", {
		username,
		password,
	});

	localStorage.setItem("accessToken", response.data.access);
	localStorage.setItem("refreshToken", response.data.refresh);

	return response.data;
}

async function logout() {
	localStorage.removeItem("accessToken");
	localStorage.removeItem("refreshToken");
}

async function register(username, email, password) {
	const response = await api.post("/accounts/register/", {
		username,
		email,
		password,
	});

	return response.data;
}

// User-related API functions
async function getCurrentUser() {
	const response = await api.get("/accounts/me/");
	return response.data;
}

async function isInstructor() {
	const user = await getCurrentUser();
	return user.is_instructor;
}

// Course-related API functions
async function getCourses() {
	const response = await api.get("/courses/");
	return response.data;
}

async function getCourse(courseId) {
	const response = await api.get(`/courses/${courseId}/`);
	return response.data;
}

async function createCourse(title, description) {
	const response = await api.post("/courses/", {
		title,
		description,
	});

	return response.data;
}

async function updateCourse(courseId, title, description) {
	const response = await api.put(`/courses/${courseId}/`, {
		title,
		description,
	});

	return response.data;
}

async function deleteCourse(courseId) {
	const response = await api.delete(`/courses/${courseId}/`);
	return response.data;
}

// Enrollment-related API functions
async function enrollInCourse(courseId) {
	const response = await api.post(`/courses/${courseId}/enroll/`);
	return response.data;
}

async function unenrollFromCourse(courseId) {
	const response = await api.post(`/courses/${courseId}/unenroll/`);
	return response.data;
}

async function getEnrolledCourses() {
	const response = await api.get("/enrollments/");
	return response.data;
}

// Chapter-related API functions
async function getChapters(courseId) {
	const response = await api.get(`/courses/${courseId}/chapters/`);
	return response.data;
}

async function getChapter(courseId, chapterId) {
	const response = await api.get(`/courses/${courseId}/chapters/${chapterId}/`);
	return response.data;
}

async function createChapter(
	courseId,
	title,
	content,
	number,
	isPublic = false,
) {
	const response = await api.post(`/courses/${courseId}/chapters/`, {
		title,
		content,
		number,
		is_public: isPublic,
	});

	return response.data;
}

async function updateChapter(
	courseId,
	chapterId,
	title,
	content,
	number,
	isPublic = false,
) {
	const response = await api.put(`/courses/${courseId}/chapters/${chapterId}/`, {
		title,
		content,
		number,
		is_public: isPublic,
	});

	return response.data;
}

async function deleteChapter(courseId, chapterId) {
	const response = await api.delete(`/courses/${courseId}/chapters/${chapterId}/`);
	return response.data;
}

// Export all API functions
export {
	login,
	logout,
	register,
	getCurrentUser,
	isInstructor,
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	enrollInCourse,
	unenrollFromCourse,
	getEnrolledCourses,
	getChapters,
	getChapter,
	createChapter,
	updateChapter,
	deleteChapter,
};
