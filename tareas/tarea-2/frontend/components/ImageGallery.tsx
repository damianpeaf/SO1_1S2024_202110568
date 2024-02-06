'use client'
import axios from 'axios';
import { useEffect, useState } from 'react';
import moment from 'moment';

interface ImageI {
    base64: string;
    uploadDate: string;
}

export const ImageGallery = () => {

    const [images, setImages] = useState<ImageI[]>([])

    const fetchImages = async () => {
        const response = await axios.get('http://localhost:3001/image');
        setImages(response.data)       
    }

    useEffect(() => {
        fetchImages()
    }, [])
    

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="grid gap-4">
        {
            images.map((image, index) => {
                return (
                    <div key={index} className="relative overflow-hidden rounded-lg h-64 w-full bg-gray-300">
                        <span className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-2 w-full">{
                            moment(image.uploadDate).format('DD/MM/YYYY HH:mm')
                        }</span>
                        <img 
                        className="h-auto max-w-full rounded-lg" 
                        src={image.base64}
                        alt="image" />
                    </div>
                )
            })
        }
    </div>
</div>
  )
}