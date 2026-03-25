import { User } from "@/types/data/user.types";

interface ExcludeUsersProps {
    users: User[] | number[];
    filteredIds: number[];
}

export default function excludeUsers({users, filteredIds}: ExcludeUsersProps): number[] {
    return users
        .filter(user => typeof user === "number" ? !filteredIds.includes(user) : !filteredIds.includes(user.id))
        .map(user => typeof user === "number" ? user : user.id);
}