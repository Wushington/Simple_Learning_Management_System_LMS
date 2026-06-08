const EMPTY_CHAPTER_CONTENT = [{ type: "p", children: [{ text: "" }] }];

function getChapterContentText(content) {
	const parsedContent =
		typeof content === "string" ? parseContentString(content) : content;

	if (!parsedContent) {
		return "";
	}

	if (Array.isArray(parsedContent)) {
		return parsedContent.map(getNodeText).join("\n").trim();
	}

	return getNodeText(parsedContent).trim();
}

function parseContentString(content) {
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

function getNextChapterNumber(chapters = []) {
	return Math.max(0, ...chapters.map((chapter) => chapter.number ?? 0)) + 1;
}

function textToChapterContent(text) {
	return text
		.split(/\n{2,}/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean)
		.map((paragraph) => ({
			type: "p",
			children: [{ text: paragraph }],
		}));
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
	getChapterContentText,
	getNextChapterNumber,
	isCourseOwnedByUser,
	textToChapterContent,
};
