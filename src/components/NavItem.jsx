import {
	AiOutlineBook,
	AiOutlineEllipsis,
	AiOutlineFileText,
} from "react-icons/ai";

function NavItem({ item, isActive, onClick, onEdit }) {
	const Icon = item.type === "course" ? AiOutlineBook : AiOutlineFileText;
	const rowClassName = ["nav-item-row", isActive ? "active" : ""]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={rowClassName}>
			<button className="nav-item" onClick={() => onClick(item)} type="button">
				<Icon aria-hidden="true" className="nav-item-icon" />
				<span>{item.title}</span>
			</button>
			{onEdit && (
				<button
					aria-label={`Edit ${item.title}`}
					className="nav-item-edit"
					onClick={onEdit}
					title={`Edit ${item.title}`}
					type="button"
				>
					<AiOutlineEllipsis aria-hidden="true" />
				</button>
			)}
		</div>
	);
}

export default NavItem;
