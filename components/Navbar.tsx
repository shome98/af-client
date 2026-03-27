import ToggleThemeButton from "@/components/ToggleThemeButton";


const NavBar = () => {

    return (
        <header className="border-b border-border/80 bg-background/80 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
                <div>
                    <p className="text-sm font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                        API Hub
                    </p>
                </div>
                <ToggleThemeButton/>
            </nav>
        </header>
    )
}

export default NavBar
