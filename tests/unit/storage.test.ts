import { describe, expect, it } from "vitest";
import { BACKUP_KEY, createDefaultPlannerData, loadPlannerData, parsePlannerData, savePlannerData, STORAGE_KEY } from "@/lib/plannerStorage";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  clear() {
    this.map.clear();
  }
  getItem(k: string) {
    return this.map.get(k) ?? null;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
}

const task = {
  id: "task_1",
  title: "Read notes",
  categoryId: "daily-study",
  courseId: null,
  dueDate: "2026-10-19",
  dueTime: null,
  completed: false,
  completedAt: null,
  createdAt: "2026-10-19T08:00:00.000Z",
};

describe("parsePlannerData", () => {
  it("returns defaults with status empty when nothing is stored", () => {
    const r = parsePlannerData(null);
    expect(r.status).toBe("empty");
    expect(r.data.courses).toHaveLength(8);
    expect(r.data.courses[0]?.code).toBe("COS 106");
  });

  it("round-trips valid data", () => {
    const data = { ...createDefaultPlannerData(), tasks: [task] };
    const r = parsePlannerData(JSON.stringify(data));
    expect(r.status).toBe("ok");
    expect(r.data).toEqual(data);
  });

  it("resets on unparseable JSON", () => {
    expect(parsePlannerData("{not json").status).toBe("reset");
    expect(parsePlannerData('"a string"').status).toBe("reset");
  });

  it("resets on an unknown version", () => {
    expect(parsePlannerData(JSON.stringify({ ...createDefaultPlannerData(), version: 99 })).status).toBe("reset");
  });

  it("salvages valid records and drops invalid ones", () => {
    const data = { ...createDefaultPlannerData(), tasks: [task, { ...task, id: "bad", title: "" }, 42], settings: "nope" };
    const r = parsePlannerData(JSON.stringify(data));
    expect(r.status).toBe("recovered");
    expect(r.data.tasks.map((t) => t.id)).toEqual(["task_1"]);
    expect(r.dropped).toBe(3);
    expect(r.data.settings.dailyTargetMinHours).toBe(3);
  });

  it("restores default courses if none survive", () => {
    const r = parsePlannerData(JSON.stringify({ ...createDefaultPlannerData(), courses: [{ id: 1 }] }));
    expect(r.data.courses).toHaveLength(8);
  });
});

describe("load/save", () => {
  it("saves and loads through the versioned key", () => {
    const storage = new MemoryStorage();
    const data = { ...createDefaultPlannerData(), tasks: [task] };
    expect(savePlannerData(data, storage)).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toContain("Read notes");
    expect(loadPlannerData(storage).data.tasks).toHaveLength(1);
  });

  it("keeps a backup of corrupt data", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, "garbage");
    const r = loadPlannerData(storage);
    expect(r.status).toBe("reset");
    expect(storage.getItem(BACKUP_KEY)).toBe("garbage");
  });
});
