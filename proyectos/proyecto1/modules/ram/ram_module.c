#include <linux/module.h>
#include <linux/proc_fs.h>
#include <linux/sysinfo.h>
#include <linux/seq_file.h>
#include <linux/mm.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Damián Peña");
MODULE_DESCRIPTION("RAM information module");
MODULE_VERSION("1.0");

struct sysinfo inf;

static int write_proc(struct seq_file *file_proc, void *v)
{
    unsigned long total, used, notused;
    unsigned long porc;
    si_meminfo(&inf);

    total = inf.totalram * inf.mem_unit;
    
    notused = (inf.freeram * inf.mem_unit) + (inf.bufferram * inf.mem_unit) + (inf.sharedram * inf.mem_unit);
    used = total - notused;
    porc = (used * 100) / total;
    seq_printf(file_proc, "{\"total\":%lu, \"used\":%lu, \"percentage\":%lu, \"free\":%lu }", total, used, porc, notused);
    return 0;
}

static int open_proc(struct inode *inode, struct file *file)
{
    return single_open(file, write_proc, NULL);
}
static struct proc_ops op_file = {
    .proc_open = open_proc,
    .proc_read = seq_read
};

static int __init mod_init(void)
{
    proc_create("ram_so1_1s2024", 0, NULL, &op_file);
    printk(KERN_INFO "RAM module mounted\n");
    return 0;
}

static void __exit mod_cleanup(void)
{
    remove_proc_entry("ram_so1_1s2024", NULL);
    printk(KERN_INFO "RAM module removed \n");
}

module_init(mod_init);
module_exit(mod_cleanup);