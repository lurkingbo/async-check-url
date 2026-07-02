interface QueueItem {
  groupId: string;
  start: () => void;
  cancel: () => void;
}

interface RunOptions {
  groupId: string;
  onCancel: () => void;
  onStart: () => void;
  task: () => Promise<void>;
}

export class Semaphore {
  private activeCount = 0;
  private queue: QueueItem[] = [];
  private readonly cancelledGroups = new Set<string>();

  constructor(private readonly limit: number) {}

  public isGroupCancelled(groupId: string): boolean {
    return this.cancelledGroups.has(groupId);
  }

  public cancelGroup(groupId: string): void {
    if (this.cancelledGroups.has(groupId)) {
      return;
    }

    this.cancelledGroups.add(groupId);
    this.dropQueued(groupId);
  }

  public run({ groupId, onCancel, onStart, task }: RunOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      let started = false;

      const start = () => {
        if (this.isGroupCancelled(groupId)) {
          onCancel();
          resolve();
          return;
        }

        started = true;
        onStart();
        this.acquireSlot();

        void task()
          .then(resolve)
          .catch(reject)
          .finally(() => this.releaseSlot());
      };

      const queueItem: QueueItem = {
        groupId,
        start,
        cancel: () => {
          if (!started) {
            onCancel();
          }

          resolve();
        },
      };

      if (this.hasFreeSlot()) {
        start();
      } else {
        this.queue.push(queueItem);
      }
    });
  }

  private hasFreeSlot(): boolean {
    return this.activeCount < this.limit;
  }

  private acquireSlot(): void {
    this.activeCount++;
  }

  private releaseSlot(): void {
    this.activeCount--;
    this.runNextFromQueue();
  }

  private dropQueued(groupId: string): void {
    this.queue = this.queue.filter((item) => {
      if (item.groupId === groupId) {
        item.cancel();
        return false;
      }

      return true;
    });
  }

  private runNextFromQueue(): void {
    while (this.queue.length > 0) {
      const next = this.queue.shift()!;

      if (this.isGroupCancelled(next.groupId)) {
        next.cancel();
        continue;
      }

      next.start();
      return;
    }
  }
}
