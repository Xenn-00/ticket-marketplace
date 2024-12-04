"use client";

import { Search } from "lucide-react";
import Form from "next/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function SearchBar() {
  return (
    <div>
      <Form action={"/search"} className="relative">
        <Input
          type="text"
          name="q"
          placeholder="Search for events..."
          className="focus:ring-1 focus:ring-blue-600 focus:border-transparent  focus:outline-none border-gray-200 border rounded-xl"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Button
          type="submit"
          variant={"default"}
          className="absolute right-3 top-1/2 -translate-y-1/2 translate-x-3 bg-blue-600 text-white rounded-tr-xl rounded-br-xl text-sm/6 font-medium hover:bg-blue-700 transition-colors duration-200"
          size={"default"}
        >
          Search
        </Button>
      </Form>
    </div>
  );
}

export default SearchBar;
