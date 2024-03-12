#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/sched.h>
#include <linux/timekeeping.h>
#include <linux/timer.h>
#include <linux/jiffies.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <asm/uaccess.h>
#include <linux/mm.h>
#include <linux/sched/cputime.h>
#include <linux/timekeeping.h>
#include <linux/time.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Damian");
MODULE_DESCRIPTION("Informacion cpu");
MODULE_VERSION("1.0");

struct task_struct *task;       // sched.h para tareas/procesos
struct task_struct *task_child; // index de tareas secundarias
struct list_head *list;         // lista de cada tareas
struct task_struct *cpu;       // sched.h para tareas/procesos
uint64_t total_time_cpu;
uint64_t total_usage;
unsigned long usage_percentage;

static void traverse_children(struct seq_file *file_proc, struct list_head *children);
static int escribir_a_proc(struct seq_file *file_proc, void *v)
{
    int running = 0;
    int sleeping = 0;
    int zombie = 0;
    int stopped = 0;
    unsigned long rss;
    unsigned long total_ram_pages;

    total_ram_pages = totalram_pages();
    if (!total_ram_pages)
    {
        pr_err("No memory available\n");
        return -EINVAL;
    }

#ifndef CONFIG_MMU
    pr_err("No MMU, cannot calculate RSS.\n");
    return -EINVAL;
#endif


    total_time_cpu = 0;
    total_usage = 0;   
    usage_percentage=0;

    for_each_process(cpu) {
        uint64_t cpu_time_ns;
        cpu_time_ns = cpu->utime + cpu->stime;
        total_usage += cpu_time_ns;
    }

    total_time_cpu = ktime_to_ns(ktime_get());

    if (total_time_cpu > 0) { usage_percentage = (total_usage * 100) / total_time_cpu; }
    else { usage_percentage = 0; }

    //---------------------------------------------------------------------------
    seq_printf(file_proc, "{\n\"percentage\": %ld,\n", usage_percentage);
    seq_printf(file_proc, "\"total_usage\":%u,\n", total_usage);
    seq_printf(file_proc, "\"total_time_cpu\":%u,\n", total_time_cpu);
    seq_printf(file_proc, "\"processes\":[\n");

    int first_process = 1;

    for_each_process(cpu) {
        if (!first_process) {seq_printf(file_proc, ",\n");}
        first_process = 0;
        seq_printf(file_proc, "    {\n");
        seq_printf(file_proc, "      \"pid\": %d,\n", cpu->pid);
        seq_printf(file_proc, "      \"name\": \"%s\",\n", cpu->comm);
        seq_printf(file_proc, "      \"state\": %u,\n", cpu->__state);
        if (!list_empty(&cpu->children)) {
            seq_printf(file_proc, "      \"child\": [\n");
            traverse_children(file_proc, &cpu->children);
            seq_printf(file_proc, "\n      ]");
        } else {
            seq_printf(file_proc, "      \"child\": []");
        }

        seq_printf(file_proc, "\n    }");
    }

    seq_printf(file_proc, "\n  ]\n");
    seq_printf(file_proc, "}\n");

    return 0;
}

static void traverse_children(struct seq_file *file_proc, struct list_head *children) {
    struct list_head *lstProcess;
    struct task_struct *child;
    int first_child = 1;

    list_for_each(lstProcess, children) {
        if (!first_child) { seq_printf(file_proc, ",\n");}
        first_child = 0;

        child = list_entry(lstProcess, struct task_struct, sibling);

        seq_printf(file_proc, "        {\n");
        seq_printf(file_proc, "          \"pid\": %d,\n", child->pid);
        seq_printf(file_proc, "          \"name\": \"%s\",\n", child->comm);
        seq_printf(file_proc, "          \"state\": %u,\n", child->__state);
        seq_printf(file_proc, "          \"pidPadre\": %u,\n", child->parent->pid);
        if (!list_empty(&child->children)) {
            seq_printf(file_proc, "          \"child\": [\n");
            traverse_children(file_proc, &child->children);
            seq_printf(file_proc, "\n          ]");
        } else {
            seq_printf(file_proc, "          \"child\": []");
        }
        seq_printf(file_proc, "        }");
    }
}

static int abrir_aproc(struct inode *inode, struct file *file)
{
    return single_open(file, escribir_a_proc, NULL);
}

static struct proc_ops archivo_operaciones = {
    .proc_open = abrir_aproc,
    .proc_read = seq_read};

static int __init modulo_init(void)
{
    proc_create("cpu_so1_1s2024", 0, NULL, &archivo_operaciones);
    printk(KERN_INFO "Insertar Modulo CPU\n");
    return 0;
}

static void __exit modulo_cleanup(void)
{
    remove_proc_entry("cpu_so1_1s2024", NULL);
    printk(KERN_INFO "Remover Modulo CPU\n");
}

module_init(modulo_init);
module_exit(modulo_cleanup);