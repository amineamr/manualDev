"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Shop {
    id: string
    name: string
    brand: string
    location: string
    contact_email: string
}

interface ShopSelectorProps {
    shops: Shop[]
    onSelectShop: (shop: Shop) => void
}

export function ShopSelector({ shops, onSelectShop }: ShopSelectorProps) {
    const [activeFilters, setActiveFilters] = useState<{ location: string | null; brand: string | null }>({
        location: null,
        brand: null,
    })

    const brands = useMemo(() => Array.from(new Set(shops.map((s) => s.brand))), [shops])
    const locations = useMemo(() => Array.from(new Set(shops.map((s) => s.location))), [shops])

    const filteredShops = useMemo(() => {
        return shops.filter((shop) => {
            return (
                (!activeFilters.location || shop.location === activeFilters.location) &&
                (!activeFilters.brand || shop.brand === activeFilters.brand)
            )
        })
    }, [shops, activeFilters])

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">Sélectionner un magasin</h2>
                <p className="text-muted-foreground">Choisissez le magasin à auditer</p>
            </div>

            {/* Filters */}
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="text-sm font-medium mb-1 block">Lieu</label>
                    <Select
                        value={activeFilters.location ?? "all"}
                        onValueChange={(val) =>
                            setActiveFilters((prev) => ({ ...prev, location: val === "all" ? null : val }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un lieu" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            {locations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                    {loc}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="text-sm font-medium mb-1 block">Marque</label>
                    <Select
                        value={activeFilters.brand ?? "all"}
                        onValueChange={(val) =>
                            setActiveFilters((prev) => ({ ...prev, brand: val === "all" ? null : val }))
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une marque" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand} value={brand}>
                                    {brand}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Shops list */}
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {filteredShops.length > 0 ? (
                    filteredShops.map((shop) => (
                        <Card
                            key={shop.id}
                            className="hover:shadow-md transition-shadow border-border bg-card cursor-pointer"
                            onClick={() => onSelectShop(shop)}
                        >
                            <CardHeader className="py-2 px-3">
                                <CardTitle className="text-sm font-semibold text-foreground">{shop.name}</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">{shop.brand}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center col-span-full">
                        Aucun magasin trouvé avec ces filtres.
                    </p>
                )}
            </div>
        </div>
    )
}
