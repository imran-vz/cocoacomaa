'use client'

import { useCart } from '../providers/CartProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type DessertCardProps = {
  id: number
  name: string
  price: number
  image: string
}

export const DessertCard: React.FC<DessertCardProps> = ({ id, name, price, image }) => {
  const { addToCart } = useCart()

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <img src={image} alt={name} className="w-full h-48 object-cover rounded-md" />
        <p className="mt-2 text-xl font-bold">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => addToCart({ id, name, price })} className="w-full">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}

