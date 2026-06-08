import {
	AiOutlineBook,
	AiOutlineEllipsis,
	AiOutlineFileText,
} from "react-icons/ai";

function NavItem({
	item,
	isActive,
	isExpanded,
	isNested = false,
	onClick,
	onEdit,
	trailingIcon,
}) {
	const Icon = item.type === "course" ? AiOutlineBook : AiOutlineFileText;
	const rowClassName = [
		"nav-item-row",
		isActive ? "active" : "",
		isNested ? "nested" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={rowClassName}>
			<button
				aria-expanded={isExpanded}
				className="nav-item"
				onClick={() => onClick(item)}
				type="button"
			>
				<Icon aria-hidden="true" className="nav-item-icon" />
				<span>{item.title}</span>
				{trailingIcon}
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
