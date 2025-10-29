import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface IconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIcon: (icon: string) => void;
  currentIcon?: string;
}

const iconGroups = {
  "Work & Productivity": [
    "work", "business_center", "laptop", "computer", "keyboard", "mouse",
    "monitor", "phone", "email", "inbox", "send", "drafts", "archive",
    "folder", "description", "assignment", "task", "checklist", "event",
    "calendar_today", "schedule", "alarm", "timer", "hourglass_empty",
    "trending_up", "analytics", "bar_chart", "pie_chart", "assessment"
  ],
  "Education & Learning": [
    "school", "menu_book", "auto_stories", "book", "library_books",
    "import_contacts", "chrome_reader_mode", "article", "newspaper",
    "science", "biotech", "calculate", "functions", "psychology",
    "lightbulb", "tips_and_updates", "emoji_objects", "quiz", "fact_check",
    "grading", "history_edu", "workspace_premium", "military_tech"
  ],
  "Health & Fitness": [
    "favorite", "health_and_safety", "medical_services", "medication",
    "vaccines", "healing", "monitor_heart", "ecg_heart", "cardiology",
    "fitness_center", "exercise", "sports_gymnastics", "sports_martial_arts",
    "self_improvement", "spa", "hot_tub", "pool", "water_drop",
    "local_drink", "restaurant", "nutrition", "lunch_dining", "dinner_dining"
  ],
  "Shopping & Finance": [
    "shopping_cart", "shopping_bag", "store", "storefront", "local_mall",
    "local_grocery_store", "payments", "credit_card", "account_balance_wallet",
    "account_balance", "savings", "paid", "currency_rupee", "attach_money",
    "euro", "currency_pound", "currency_yen", "currency_bitcoin", "receipt",
    "receipt_long", "point_of_sale", "price_check", "sell", "shopping_basket"
  ],
  "Entertainment & Hobbies": [
    "sports_esports", "videogame_asset", "casino", "toys", "extension",
    "music_note", "headphones", "album", "piano", "guitar", "mic",
    "movie", "theaters", "tv", "live_tv", "video_library", "photo_camera",
    "camera_alt", "photo_library", "image", "palette", "brush", "draw",
    "edit", "color_lens", "format_paint", "sports_soccer", "sports_basketball"
  ],
  "Travel & Places": [
    "flight", "flight_takeoff", "flight_land", "luggage", "backpack",
    "travel_explore", "map", "location_on", "place", "pin_drop", "explore",
    "public", "language", "directions_car", "directions_bus", "train",
    "subway", "tram", "directions_bike", "two_wheeler", "local_taxi",
    "hotel", "apartment", "home", "house", "cottage", "cabin", "beach_access"
  ],
  "Social & Communication": [
    "people", "group", "person", "account_circle", "face", "mood",
    "sentiment_satisfied", "emoji_emotions", "chat", "forum", "comment",
    "message", "textsms", "call", "phone_in_talk", "video_call",
    "videocam", "campaign", "notifications", "notifications_active",
    "share", "thumb_up", "favorite_border", "volunteer_activism", "handshake"
  ],
  "Nature & Weather": [
    "wb_sunny", "wb_cloudy", "cloud", "thunderstorm", "ac_unit", "severe_cold",
    "rainy", "water_drop", "umbrella", "foggy", "air", "wind_power",
    "nature", "park", "forest", "eco", "energy_savings_leaf", "local_florist",
    "yard", "grass", "potted_plant", "agriculture", "pets", "cruelty_free"
  ],
  "Food & Dining": [
    "restaurant_menu", "fastfood", "local_pizza", "local_cafe", "coffee",
    "local_bar", "liquor", "wine_bar", "cake", "cookie", "icecream",
    "ramen_dining", "rice_bowl", "egg", "breakfast_dining", "brunch_dining",
    "tapas", "set_meal", "bento", "takeout_dining", "room_service"
  ],
  "Home & Living": [
    "home_work", "living", "bed", "bedroom_parent", "bedroom_child",
    "bathroom", "shower", "bathtub", "kitchen", "countertops", "microwave",
    "oven", "blender", "coffee_maker", "dishwasher", "washing_machine",
    "vacuum", "light", "lightbulb", "chair", "weekend", "deck", "balcony"
  ],
  "Technology & Devices": [
    "devices", "smartphone", "tablet", "watch", "headset", "speaker",
    "tv_gen", "router", "wifi", "bluetooth", "usb", "memory", "storage",
    "cloud_upload", "cloud_download", "backup", "sync", "settings",
    "tune", "build", "construction", "handyman", "plumbing", "electrical_services"
  ],
  "Symbols & Icons": [
    "star", "star_border", "grade", "new_releases", "verified", "check_circle",
    "cancel", "error", "warning", "info", "help", "priority_high",
    "flag", "bookmark", "label", "sell", "local_offer", "loyalty",
    "redeem", "card_giftcard", "celebration", "cake", "auto_awesome",
    "bolt", "flash_on", "whatshot", "local_fire_department"
  ]
};

export const IconPicker = ({ open, onOpenChange, onSelectIcon, currentIcon }: IconPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = Object.entries(iconGroups).reduce((acc, [group, icons]) => {
    const filtered = icons.filter(icon => 
      icon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {} as Record<string, string[]>);

  const handleSelectIcon = (icon: string) => {
    onSelectIcon(icon);
    onOpenChange(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-surface border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-xl">
            <span className="material-symbols-outlined text-primary">palette</span>
            Choose Icon
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              search
            </span>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              className="pl-10 rounded-2xl bg-background border-border"
            />
          </div>

          <ScrollArea className="h-[50vh] pr-4">
            <div className="space-y-6">
              {Object.entries(filteredGroups).map(([group, icons]) => (
                <div key={group} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {group}
                  </h3>
                  <div className="grid grid-cols-8 gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => handleSelectIcon(icon)}
                        className={`
                          aspect-square rounded-xl flex items-center justify-center
                          transition-all hover:scale-110 hover:bg-primary/20
                          ${currentIcon === icon 
                            ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' 
                            : 'bg-background hover:bg-primary/10 text-foreground'
                          }
                        `}
                        title={icon.replace(/_/g, ' ')}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {icon}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(filteredGroups).length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-muted-foreground mb-4">
                    search_off
                  </span>
                  <p className="text-muted-foreground">No icons found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
