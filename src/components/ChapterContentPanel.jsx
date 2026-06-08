import { getChapterContentText } from "../lib/chapterUtils.js";

function ChapterContentPanel({ emptyMessage, mode, selectedChapter }) {
	if (!selectedChapter) {
		return <p className="surface-message">{emptyMessage}</p>;
	}

	const contentText = getChapterContentText(selectedChapter.content);

	return (
		<section className="chapter-content-shell">
			<p className="learning-eyebrow">Chapter {selectedChapter.number ?? ""}</p>
			<h3>{selectedChapter.title}</h3>
			{contentText ?
				<p className="chapter-content-body">{contentText}</p>
			:	<p className="surface-message">
					{mode === "edit" ?
						"No content has been added to this chapter yet."
					:	"No content is available for this chapter yet."}
				</p>
			}
		</section>
	);
}

export default ChapterContentPanel;
