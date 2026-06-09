<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $expense = parent::toArray($request);
        $expense['formatted_created_at'] = $this->resource->created_at->diffForHumans();
        $expense['formatted_updated_at'] = $this->resource->updated_at->diffForHumans();
        return $expense;
    }
}
