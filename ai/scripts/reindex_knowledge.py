from yantra_ai.core.rag import build_vector_index


def main() -> None:
    vector_index = build_vector_index(force=True)
    print(
        f"Built local vector index with {len(vector_index.chunks)} chunks using "
        f"{vector_index.model_name}."
    )


if __name__ == "__main__":
    main()
