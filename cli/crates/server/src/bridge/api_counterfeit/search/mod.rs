#![allow(clippy::module_name_repetitions)]
pub mod cursor;
pub mod paginated_searcher;
pub mod protocol;
pub mod query;
pub mod query_builder;
pub mod runtime;
mod tokenizer;
pub mod utils;

pub use cursor::Cursor;
pub use paginated_searcher::TopDocsPaginatedSearcher;
pub use protocol::{Hit, Info, PaginatedHits, Pagination, QueryExecutionRequest, QueryExecutionResponse};
pub use query::Query;
pub use query_builder::{SearchError, SearchResult, TantivyQueryBuilder};
pub use runtime::{Config, FieldType, Schema};
use tantivy::{directory::RamDirectory, Index};
use tantivy::{store::Compressor, tokenizer::TokenizerManager, IndexSettings};
pub use utils::ID_FIELD;

pub fn open_index(schema: &Schema) -> tantivy::Result<(Index, Vec<IndexedField>)> {
    use tokenizer::{simple_normalized_tokenizer, TOKENIZER_NAME};
    use utils::{to_tantivy, tokenized_field_name};

    let index = Index::builder()
        .schema(to_tantivy(schema))
        .tokenizers({
            let tokenizers = TokenizerManager::default();
            tokenizers.register(TOKENIZER_NAME, simple_normalized_tokenizer());
            tokenizers
        })
        .settings(IndexSettings {
            docstore_compression: Compressor::None,
            ..Default::default()
        })
        .open_or_create(RamDirectory::create())?;

    let tantivy_schema = index.schema();
    let fields = schema
        .fields
        .iter()
        .map(|(name, entry)| IndexedField {
            name: name.clone(),
            doc_key: tantivy_schema.get_field(name).expect(
                "Tantivy field always exist, otherwise the index could not have been created in the first place.",
            ),
            tokenized_doc_key: tantivy_schema.get_field(&tokenized_field_name(name)),
            ty: entry.ty.clone(),
        })
        .collect();
    Ok((index, fields))
}

#[derive(Debug, Clone)]
pub struct IndexedField {
    pub name: String,
    pub doc_key: tantivy::schema::Field,
    pub tokenized_doc_key: Option<tantivy::schema::Field>,
    pub ty: FieldType,
}