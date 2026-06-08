import {
	AiOutlineBook,
	AiOutlineEllipsis,
	AiOutlineFileText,
} from "react-icons/ai";
import { BiCopy, BiLogOut } from "react-icons/bi";

function NavItem({
	isCodeCopied = false,
	item,
	isActive,
	onClick,
	onCopyCode,
	onEdit,
	onLeave,
}) {
	const Icon = item.type === "course" ? AiOutlineBook : AiOutlineFileText;
	const rowClassName = ["nav-item-row", isActive ? "active" : ""]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={rowClassName}>
			<button className="nav-item" onClick={() => onClick(item)} type="button">
				<Icon aria-hidden="true" className="nav-item-icon" />
				<span className="nav-item-text">
					<span>{item.title}</span>
					{item.course_code && (
						<span className="nav-item-meta">Code: {item.course_code}</span>
					)}
				</span>
			</button>
			{onCopyCode && (
				<button
					aria-label={`Copy course code for ${item.title}`}
					className="nav-item-action"
					onClick={onCopyCode}
					title={isCodeCopied ? "Copied" : `Copy code ${item.course_code}`}
					type="button"
				>
					<BiCopy aria-hidden="true" />
				</button>
			)}
			{onEdit && (
				<button
					aria-label={`Edit ${item.title}`}
					className="nav-item-action"
					onClick={onEdit}
					title={`Edit ${item.title}`}
					type="button"
				>
					<AiOutlineEllipsis aria-hidden="true" />
				</button>
			)}
			{onLeave && (
				<button
					aria-label={`Leave ${item.title}`}
					className="nav-item-action danger"
					onClick={onLeave}
					title={`Leave ${item.title}`}
					type="button"
				>
					<BiLogOut aria-hidden="true" />
				</button>
			)}
		</div>
	);
}

export default NavItem;
