package main

import (
	"bufio"
	b64 "encoding/base64"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

func listDirectory(directory string) ([]string, error) {
	var files []string

	err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
		if path != directory {
			files = append(files, strings.TrimPrefix(path, directory))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return files, nil
}

func copyScan(input string, writeScanner *bufio.Writer) error {
	data, err := ioutil.ReadFile(input)
	if err != nil {
		fmt.Println(err)
	}
	res := b64.StdEncoding.EncodeToString([]byte(data))
	writeScanner.WriteString(res)
	writeScanner.Flush()
	return nil
}

func copyFile(input string, output string, filename string, wg *sync.WaitGroup) {
	defer wg.Done()
	fileRead, err := os.Open(input + filename)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer fileRead.Close()
	fileWrite, err := os.Create(output + strings.TrimSuffix(filename, filepath.Ext(filename)) + ".res")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer fileWrite.Close()
	writeScanner := bufio.NewWriter(fileWrite)

	err = copyScan(input+"/"+filename, writeScanner)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func scanDir(input string, output string) error {
	var wg sync.WaitGroup
	files, err := listDirectory(input)
	if err != nil {
		return err
	}
	wg.Add(len(files))
	for _, file := range files {
		go copyFile(input, output, file, &wg)
	}
	wg.Wait()
	fmt.Print("Total number of processed files: ")
	fmt.Print(len(files))
	fmt.Print("\n")
	return nil
}

func main() {
	pathToSourceDir := os.Args[1]
	pathToDestinationDir := os.Args[2]
	err := scanDir(pathToSourceDir, pathToDestinationDir)
	if err != nil {
		fmt.Println(err)
	}
}
