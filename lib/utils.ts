import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isBase64Image(imageData: string) {
    const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
    return base64Regex.test(imageData);
}

export function formatDateForPost(_date: string) {
    let options: Intl.DateTimeFormatOptions;

    const now = new Date();
    const _tempDate = new Date(_date);

    if (_tempDate.getDate() === now.getDate()) {
        const optionsTime: any = {
            style: 'short',
            numeric: 'always'
        };

        const diffInMinutes = (now.getTime() - _tempDate.getTime()) / 1000 / 60;
        if (diffInMinutes < 1) {
            return new Intl.RelativeTimeFormat([], optionsTime).format(-Math.floor(diffInMinutes * 60), 'seconds')
        }
        else if(diffInMinutes < 60){
            return new Intl.RelativeTimeFormat([], optionsTime).format(-Math.floor(diffInMinutes), 'minutes')
        }
        else {
            return new Intl.RelativeTimeFormat([], optionsTime).format(-Math.floor(diffInMinutes / 60), 'hours')
        }
    } else if (_tempDate.getFullYear() === now.getFullYear()) {
        options = {
            month: "short",
            day: "numeric",
        };
        return _tempDate.toLocaleDateString([], options);
    } else {
        options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        return _tempDate.toLocaleDateString([], options);
    }
}


export function formatDateString(dateString: string) {
    const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
    };

    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString(undefined, options);

    const time = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });

    return `${time} - ${formattedDate}`;
}

export function formatThreadCount(count: number): string {
    if (count === 0) {
        return "No Threads";
    } else {
        const threadCount = count.toString().padStart(2, "0");
        const threadWord = count === 1 ? "Thread" : "Threads";
        return `${threadCount} ${threadWord}`;
    }
}