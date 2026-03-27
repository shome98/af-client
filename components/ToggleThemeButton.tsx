'use client';
import {RiMoonFill, RiSunLine} from '@remixicon/react';
import {Button} from '@/components/ui/button';

const STORAGE_KEY = 'af-theme';
const ToggleThemeButton = () => {
    const toggleTheme = () => {
        const root = document.documentElement;
        const nextTheme = root.classList.contains('dark') ? 'light' : 'dark';

        root.classList.toggle('dark', nextTheme === 'dark');
        root.style.colorScheme = nextTheme;
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
    };
    return (
        <Button
            type="button"
            className="bg-transparent text-foreground hover:bg-muted/30 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
        >
            <RiSunLine size={18} className="hidden dark:block"/>
            <RiMoonFill size={18} className="block dark:hidden"/>
        </Button>
    );
};
export default ToggleThemeButton;
