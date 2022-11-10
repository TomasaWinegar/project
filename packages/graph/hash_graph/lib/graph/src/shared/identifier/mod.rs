use chrono::{DateTime, Utc};
use serde::{Serialize, Serializer};
use serde_json;
use utoipa::{openapi, ToSchema};

use crate::identifier::{knowledge::EntityId, ontology::OntologyTypeEditionId};

pub mod account;
pub mod knowledge;
pub mod ontology;

pub type Timestamp = DateTime<Utc>;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum GraphElementId {
    OntologyElementId(OntologyTypeEditionId),
    KnowledgeGraphElementId(EntityId),
}

impl Serialize for GraphElementId {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            Self::KnowledgeGraphElementId(identifier) => identifier.serialize(serializer),
            Self::OntologyElementId(identifier) => identifier.serialize(serializer),
        }
    }
}

// TODO: We have to do this because utoipa doesn't understand serde untagged
//  https://github.com/juhaku/utoipa/issues/320
impl ToSchema for GraphElementId {
    fn schema() -> openapi::Schema {
        openapi::OneOfBuilder::new()
            .item(openapi::Object::with_type(openapi::SchemaType::String))
            .example(Some(serde_json::json!(
                "6013145d-7392-4630-ab16-e99c59134cb6"
            )))
            .into()
    }
}
