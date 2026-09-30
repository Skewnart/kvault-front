import type { EntryDTO } from "./entry_dto";

export interface FolderDTO {
    id: String;
    name: String;
    entries: EntryDTO[];
}
