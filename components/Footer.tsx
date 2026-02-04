export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footerInner">
                <div className="brandMini">
                    <img src="/logo-a.png" alt="Logo" className="logoImgSmall" />
                    <span>Akademik IC Gowa</span>
                </div>
                <div className="muted">© {new Date().getFullYear()} • All rights reserved</div>
            </div>
        </footer>
    );
}
