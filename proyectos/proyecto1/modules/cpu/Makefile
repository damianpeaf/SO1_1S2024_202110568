obj-m += cpu_module.o
CFLAGS += -mno-sse
LDFLAGS += -mno-sse

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean