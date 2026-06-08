const EMPTY_CHAPTER_CONTENT = [{ type: "p", children: [{ text: "" }] }];
const EMPTY_POST_CONTENT = [{ type: "p", children: [{ text: "" }] }];

function buildChapterPost({ body = EMPTY_POST_CONTENT, id, title = "Untitled" }) {
	const now = new Date().toISOString();

	return {
		id: id ?? crypto.randomUUID(),
		title: title.trim() || "Untitled",
		body: normalizePostBody(body),
		createdAt: now,
		updatedAt: now,
	};
}

function buildChapterPostsContent(posts) {
	return {
		version: 1,
		posts,
	};
}

function getChapterContentText(content) {
	return getChapterPosts(content)
		.map((post) => getPostText(post.body))
		.join("\n")
		.trim();
}

function getChapterPosts(content) {
	const parsedContent = parseMaybeJson(content);

	if (parsedContent?.posts && Array.isArray(parsedContent.posts)) {
		return parsedContent.posts.map((post) => ({
			...post,
			body: normalizePostBody(post.body),
		}));
	}

	if (Array.isArray(parsedContent)) {
		const text = getPostText(parsedContent);

		return text ?
				[
					{
						id: "legacy-content",
						title: "Content",
						body: normalizePostBody(parsedContent),
					},
				]
			:	[];
	}

	return [];
}

function getPostText(body) {
	return normalizePostBody(body).map(getNodeText).join("\n").trim();
}

function parseMaybeJson(content) {
	if (typeof content !== "string") {
		return content;
	}

	try {
		return JSON.parse(content);
	} catch {
		return content;
	}
}

function getNodeText(node) {
	if (typeof node === "string") {
		return node;
	}

	if (!node) {
		return "";
	}

	if (typeof node.text === "string") {
		return node.text;
	}

	if (Array.isArray(node.children)) {
		return node.children.map(getNodeText).join("");
	}

	return "";
}

function normalizePostBody(body) {
	return Array.isArray(body) && body.length > 0 ? body : EMPTY_POST_CONTENT;
}

function getNextChapterNumber(chapters = []) {
	return Math.max(0, ...chapters.map((chapter) => chapter.number ?? 0)) + 1;
}

function textToChapterContent(text) {
	const body = text
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
		.map((paragraph) => ({
			type: "p",
			children: [{ text: paragraph }],
		}));

	return buildChapterPostsContent([
		buildChapterPost({
			body,
			title: "Content",
		}),
	]);
}

function isCourseOwnedByUser(course, user) {
	if (!course.instructor || !user?.username) {
		return false;
	}

	return (
		course.instructor === user.username ||
		course.instructor.startsWith(`${user.username} `)
	);
}

export {
	EMPTY_CHAPTER_CONTENT,
	EMPTY_POST_CONTENT,
	buildChapterPost,
	buildChapterPostsContent,
	getChapterContentText,
	getChapterPosts,
	getPostText,
	getNextChapterNumber,
	isCourseOwnedByUser,
	normalizePostBody,
	textToChapterContent,
};
