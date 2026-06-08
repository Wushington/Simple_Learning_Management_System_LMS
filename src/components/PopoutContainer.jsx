import { AiOutlineClose } from "react-icons/ai";

function PopoutContainer({ title, children, onClose }) {
	return (
		<div className="popout-backdrop" role="presentation">
			<section
				aria-labelledby="popout-title"
				aria-modal="true"
				className="popout-container"
				role="dialog"
			>
				<header className="popout-header">
					<h2 id="popout-title">{title}</h2>
					<button
						aria-label="Close"
						className="icon-button secondary"
						onClick={onClose}
						title="Close"
						type="button"
					>
						<AiOutlineClose aria-hidden="true" />
					</button>
				</header>
				{children}
			</section>
		</div>
	);
}

export default PopoutContainer;
