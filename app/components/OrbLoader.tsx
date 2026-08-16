import styles from "./OrbLoader.module.css";

export default function OrbLoader() {
	return (
		<div className="size-4.5 shrink-0 rotate-90">
			<div className={`${styles.loader} scale-[0.18] origin-top-left`}>
				<svg width="100" height="100" viewBox="0 0 100 100" aria-hidden="true">
					<defs>
						<mask id="clipping">
							<polygon points="0,0 100,0 100,100 0,100" fill="black" />
							<polygon points="25,25 75,25 50,75" fill="white" />
							<polygon points="50,25 75,75 25,75" fill="white" />
							<polygon points="35,35 65,35 50,65" fill="white" />
						</mask>
					</defs>
				</svg>
				<div className={styles.box} />
			</div>
		</div>
	);
}
