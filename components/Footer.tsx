export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footerInner">
                <div className="brandMini">
                    <span className="logoMark" aria-hidden="true" />
                    <span>MarineLanding</span>
                </div>
                <div className="muted">© {new Date().getFullYear()} • All rights reserved</div>
            </div>
        </footer>
    );
}
