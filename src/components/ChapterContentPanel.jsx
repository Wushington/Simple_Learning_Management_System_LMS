function ChapterContentPanel({ emptyMessage, mode, selectedChapter }) {
	if (!selectedChapter) {
		return <p className="surface-message">{emptyMessage}</p>;
	}

	return (
		<section className="chapter-content-shell">
			<p className="learning-eyebrow">Chapter {selectedChapter.number ?? ""}</p>
			<h3>{selectedChapter.title}</h3>
			<p className="surface-message">
				{mode === "edit" ?
					"The Plate editor for this chapter will live here."
				:	"Read-only chapter content will render here."}
			</p>
		</section>
	);
}

export default ChapterContentPanel;
