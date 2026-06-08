import { useState } from "react";
import { AiOutlineDelete, AiOutlineEdit, AiOutlineLeft } from "react-icons/ai";
import { RichTextReadOnly } from "./RichText.jsx";
import { getChapterPosts, getPostText } from "../lib/chapterUtils.js";

function ChapterContentPanel({
	emptyMessage,
	mode,
	onDeletePost,
	onEditPost,
	selectedChapter,
}) {
	const [openPostId, setOpenPostId] = useState(null);

	if (!selectedChapter) {
		return <p className="surface-message">{emptyMessage}</p>;
	}

	const posts = getChapterPosts(selectedChapter.content);
	const openPost = posts.find((post) => post.id === openPostId) ?? null;

	if (openPost) {
		return (
			<section className="chapter-content-area">
				<button
					className="content-back-button"
					onClick={() => setOpenPostId(null)}
					type="button"
				>
					<AiOutlineLeft aria-hidden="true" />
					<span>Back</span>
				</button>
				<article className="content-reader">
					<p className="learning-eyebrow">Chapter {selectedChapter.number ?? ""}</p>
					<h3>{openPost.title}</h3>
					<RichTextReadOnly value={openPost.body} />
				</article>
			</section>
		);
	}

	return (
		<section className="chapter-content-area">
			<div className="chapter-content-title">
				<p className="learning-eyebrow">Chapter {selectedChapter.number ?? ""}</p>
				<h3>{selectedChapter.title}</h3>
			</div>

			{posts.length === 0 ?
				<p className="surface-message">
					{mode === "edit" ?
						"No content has been added to this chapter yet."
					:	"No content is available for this chapter yet."}
				</p>
			:	<div className="content-post-grid">
					{posts.map((post) => (
						<article className="content-post-card" key={post.id}>
							<button
								className="content-post-open"
								onClick={() => setOpenPostId(post.id)}
								type="button"
							>
								<div className="content-post-paper" aria-hidden="true">
									<PostPreviewLines body={post.body} />
								</div>
								<div>
									<h4>{post.title}</h4>
									<p>{getPostText(post.body) || "No body text"}</p>
								</div>
							</button>
							{mode === "edit" && (
								<div className="content-post-actions">
									<button
										aria-label={`Edit ${post.title}`}
										className="content-post-action"
										onClick={() => onEditPost(post)}
										title={`Edit ${post.title}`}
										type="button"
									>
										<AiOutlineEdit aria-hidden="true" />
									</button>
									<button
										aria-label={`Delete ${post.title}`}
										className="content-post-action danger"
										onClick={() => onDeletePost(post)}
										title={`Delete ${post.title}`}
										type="button"
									>
										<AiOutlineDelete aria-hidden="true" />
									</button>
								</div>
							)}
						</article>
					))}
				</div>
			}
		</section>
	);
}

function PostPreviewLines({ body }) {
	const text = getPostText(body);
	const lines = text ? text.split(/\s+/).slice(0, 18) : [];
	const lineCount = Math.max(6, Math.min(10, Math.ceil(lines.length / 3)));

	return Array.from({ length: lineCount }, (_, index) => (
		<span
			className={
				index === lineCount - 1 ? "post-preview-line short" : "post-preview-line"
			}
			key={index}
		/>
	));
}

export default ChapterContentPanel;
